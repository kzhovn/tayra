# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import uuid
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///tayra.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Models
class Category(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(7), nullable=False)

class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.String(36), db.ForeignKey('category.id'))
    priority = db.Column(db.String(20), default='extra')
    due_date = db.Column(db.Date)
    do_date = db.Column(db.Date)
    completed = db.Column(db.Boolean, default=False)
    is_ephemeral = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = db.relationship('Category', backref='tasks')
    subtasks = db.relationship('Subtask', backref='task', cascade='all, delete-orphan')

class Subtask(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)


# Serializers
def serialize_task(task):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'category': task.category_id,
        'priority': task.priority,
        'dueDate': task.due_date.isoformat() if task.due_date else None,
        'doDate': task.do_date.isoformat() if task.do_date else None,
        'completed': task.completed,
        'isEphemeral': task.is_ephemeral,
        'notes': task.notes,
        'subtasks': [{'id': st.id, 'title': st.title, 'completed': st.completed} for st in task.subtasks],
        'dependencies': [],
        'recurring': None
    }

def serialize_category(category):
    return {
        'id': category.id,
        'name': category.name,
        'color': category.color
    }


# API Routes
@app.route('/api/health')
def health_check():
    return {'status': 'healthy'}

@app.route('/api/categories')
def get_categories():
    categories = Category.query.all()
    return [serialize_category(cat) for cat in categories]

@app.route('/api/categories', methods=['POST'])
def create_category():
    data = request.json
    
    category = Category(
        name=data['name'],
        color=data.get('color', '#6B7280')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return serialize_category(category), 201

@app.route('/api/categories/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        category = Category.query.get_or_404(category_id)
        
        # Ensure default category exists
        default_category = Category.query.filter_by(id='default').first()
        if not default_category:
            default_category = Category(id='default', name='General', color='#6B7280')
            db.session.add(default_category)
            db.session.flush()
        
        # Move all tasks in this category to the default category
        tasks_in_category = Task.query.filter_by(category_id=category_id).all()
        for task in tasks_in_category:
            task.category_id = 'default'
            task.updated_at = datetime.now(timezone.utc)
        
        # Commit the task updates first
        db.session.commit()
        
        # Delete the category
        db.session.delete(category)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500

@app.route('/api/tasks')
def get_tasks():
    tasks = Task.query.all()
    return [serialize_task(task) for task in tasks]

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json

    # Ensure category_id is valid
    category_id = data.get('category', 'default')
    if not category_id or category_id == 'null' or category_id == 'undefined':
        category_id = 'default'
    
    # Verify the category exists
    if not Category.query.filter_by(id=category_id).first():
        category_id = 'default'

    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        category_id=category_id,
        priority=data.get('priority', 'extra'),
        due_date=datetime.fromisoformat(data['dueDate']).date() if data.get('dueDate') else None,
        do_date=datetime.fromisoformat(data['doDate']).date() if data.get('doDate') else None,
        is_ephemeral=data.get('isEphemeral', False),
        notes=data.get('notes', '')
    )

    db.session.add(task)
    db.session.commit()

    return serialize_task(task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json

    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    
    # Handle category update safely
    if 'category' in data:
        category_id = data['category']
        if not category_id or category_id == 'null' or category_id == 'undefined':
            category_id = 'default'
        # Verify the category exists
        if Category.query.filter_by(id=category_id).first():
            task.category_id = category_id
        else:
            task.category_id = 'default'
    
    task.priority = data.get('priority', task.priority)
    
    # Only update dates if they are explicitly provided in the request
    if 'dueDate' in data:
        task.due_date = datetime.fromisoformat(data['dueDate']).date() if data['dueDate'] else None
    if 'doDate' in data:
        task.do_date = datetime.fromisoformat(data['doDate']).date() if data['doDate'] else None
        
    task.completed = data.get('completed', task.completed)
    task.is_ephemeral = data.get('isEphemeral', task.is_ephemeral)
    task.notes = data.get('notes', task.notes)
    task.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    return serialize_task(task)

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

@app.route('/api/tasks/<task_id>/subtasks', methods=['POST'])
def create_subtask(task_id):
    # Verify task exists
    Task.query.get_or_404(task_id)
    data = request.json

    subtask = Subtask(
        task_id=task_id,
        title=data['title']
    )

    db.session.add(subtask)
    db.session.commit()

    return {'id': subtask.id, 'title': subtask.title, 'completed': subtask.completed}, 201

@app.route('/api/subtasks/<subtask_id>', methods=['PUT'])
def update_subtask(subtask_id):
    subtask = Subtask.query.get_or_404(subtask_id)
    data = request.json

    subtask.title = data.get('title', subtask.title)
    subtask.completed = data.get('completed', subtask.completed)

    db.session.commit()
    return {'id': subtask.id, 'title': subtask.title, 'completed': subtask.completed}

def init_db():
    with app.app_context():
        db.create_all()

        # Create default categories
        if not Category.query.first():
            default_categories = [
                Category(id='default', name='General', color='#6B7280'),
                Category(id='work', name='Work', color='#3B82F6'),
                Category(id='personal', name='Personal', color='#10B981'),
                Category(id='health', name='Health', color='#F59E0B')
            ]

            for cat in default_categories:
                db.session.add(cat)

            db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
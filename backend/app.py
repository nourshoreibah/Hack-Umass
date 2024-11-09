from flask import Flask, jsonify, request
from flask_restx import Api, Resource, fields
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User
from user_routes import api_ns  # Import namespace instead of blueprint



load_dotenv()

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Initialize Flask-RESTX API
api = Api(app, version="1.0", title="SkillTrade API", description="An API for SkillTrade application")

# Database configuration
DB_USERNAME = 'dbadmin'
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')

# Set up the connection to the AWS RDS PostgreSQL instance
engine = create_engine(f'postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}')
Base.metadata.create_all(engine)

# Creating a session
Session = sessionmaker(bind=engine)
session = Session()

# Define minimal expected JSON models for Swagger documentation
register_fields = api.model('Register', {
    'email': fields.String(required=True, description="The user's email"),
    'password': fields.String(required=True, description="The user's password"),
    'display_name': fields.String(required=True, description="The user's display name")
})

login_fields = api.model('Login', {
    'email': fields.String(required=True, description="The user's email"),
    'password': fields.String(required=True, description="The user's password")
})

api.add_namespace(api_ns)

# User registration route
@api.route('/register')
class Register(Resource):
    @api.expect(register_fields)
    def post(self):
        """Register a new user with email, password, and display name."""
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('display_name')

        # Check if the user already exists by email or display_name
        existing_user = session.query(User).filter((User.email == email) | (User.display_name == display_name)).first()
        if existing_user:
            return {"msg": "User with this email or display name already exists"}, 409

        # Hash the password and create a new user record
        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password_hash=hashed_password, display_name=display_name)

        # Add and commit the new user to the database
        session.add(new_user)
        session.commit()

        return {"msg": "User registered successfully"}, 201

# User login route
@api.route('/login')
class Login(Resource):
    @api.expect(login_fields)
    def post(self):
        """Authenticate and log in a user with email and password."""
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Retrieve user from database by email
        user = session.query(User).filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return {"msg": "Bad email or password"}, 401

        # Create JWT token
        access_token = create_access_token(identity=email)
        return {"access_token": access_token}

# Protected route
@api.route('/protected')
class Protected(Resource):
    @jwt_required()
    def get(self):
        """Access protected route"""
        current_user = get_jwt_identity()
        return {"logged_in_as": current_user}, 200



# Add the API to the Flask application
if __name__ == '__main__':
    app.run(debug=True)

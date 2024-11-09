from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Enum, CheckConstraint
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import os
from dotenv import load_dotenv
import enum
from sqlalchemy import text

load_dotenv()

# Create a base class for ORM models
Base = declarative_base()

# Define the FluencyLevel enum
class FluencyLevel(enum.Enum):
    beginner = "beginner"
    medium = "medium"
    advanced = "advanced"

# Define the Status enum for Requests
class RequestStatus(enum.Enum):
    default = "default"
    accepted = "accepted"
    declined = "declined"

# Define the User table
class User(Base):
    __tablename__ = 'user'
    user_id = Column(Integer, primary_key=True)
    email = Column(String(320), nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    display_name = Column(String(100), nullable=False)
    
    # Relationships
    skills = relationship("UserSkills", back_populates="user")
    community_ratings = relationship("CommunityRatings", back_populates="rater", foreign_keys="CommunityRatings.rater_id")
    teacher_ratings = relationship("TeacherRatings", back_populates="rater", foreign_keys="TeacherRatings.rater_id")
    student_ratings = relationship("StudentRatings", back_populates="rater", foreign_keys="StudentRatings.rater_id")
    goals = relationship("UserGoals", back_populates="user")

# Define the Skills table with fluency_level
class Skills(Base):
    __tablename__ = 'skills'
    skill_id = Column(Integer, primary_key=True)
    skill_name = Column(String, nullable=False)

    # Relationships
    users = relationship("UserSkills", back_populates="skill")
    tags = relationship("SkillsTags", back_populates="skill")
    goal_users = relationship("UserGoals", back_populates="skill")
    
# Define the Requests table
class Requests(Base):
    __tablename__ = 'requests'
    requester_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    requested_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    status = Column(Enum(RequestStatus), nullable=False, default=RequestStatus.default)

    # Relationships
    requester = relationship("User", foreign_keys=[requester_id], backref="sent_requests")
    requested = relationship("User", foreign_keys=[requested_id], backref="received_requests")

# Define the Tags table
class Tags(Base):
    __tablename__ = 'tags'
    tag_id = Column(Integer, primary_key=True)
    tag_name = Column(String, nullable=False)

    # Relationships
    skills = relationship("SkillsTags", back_populates="tag")

# Define the UserSkills table (many-to-many relationship between User and Skills)
class UserSkills(Base):
    __tablename__ = 'user_skills'
    user_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.skill_id'), primary_key=True)
    fluency_level = Column(Enum(FluencyLevel), nullable=False)  # Added fluency level

    # Relationships
    user = relationship("User", back_populates="skills")
    skill = relationship("Skills", back_populates="users")

class UserGoals(Base):
    __tablename__ = 'user_goals'
    user_id = Column(Integer, ForeignKey('user.user_id'), primary_key=True)
    skill_id = Column(Integer, ForeignKey('skills.skill_id'), primary_key=True)

    # Foreign key relationships
    user = relationship("User", back_populates="goals")
    skill = relationship("Skills", back_populates="goal_users")

# Define the SkillsTags table (many-to-many relationship between Skills and Tags)
class SkillsTags(Base):
    __tablename__ = 'skills_tags'
    skill_id = Column(Integer, ForeignKey('skills.skill_id'), primary_key=True)
    tag_id = Column(Integer, ForeignKey('tags.tag_id'), primary_key=True)

    # Relationships
    skill = relationship("Skills", back_populates="tags")
    tag = relationship("Tags", back_populates="skills")

# Define the CommunityRatings table
class CommunityRatings(Base):
    __tablename__ = 'community_ratings'
    rating_id = Column(Integer, primary_key=True)
    rater_id = Column(Integer, ForeignKey('user.user_id'))
    rated_id = Column(Integer, ForeignKey('user.user_id'))
    rating = Column(Integer, CheckConstraint('rating BETWEEN 1 AND 5'), nullable=False)

    # Relationships
    rater = relationship("User", foreign_keys=[rater_id], back_populates="community_ratings")
    rated = relationship("User", foreign_keys=[rated_id])

# Define the TeacherRatings table
class TeacherRatings(Base):
    __tablename__ = 'teacher_ratings'
    rating_id = Column(Integer, primary_key=True)
    rater_id = Column(Integer, ForeignKey('user.user_id'))
    rated_id = Column(Integer, ForeignKey('user.user_id'))
    rating = Column(Integer, CheckConstraint('rating BETWEEN 1 AND 5'), nullable=False)

    # Relationships
    rater = relationship("User", foreign_keys=[rater_id], back_populates="teacher_ratings")
    rated = relationship("User", foreign_keys=[rated_id])

# Define the StudentRatings table
class StudentRatings(Base):
    __tablename__ = 'student_ratings'
    rating_id = Column(Integer, primary_key=True)
    rater_id = Column(Integer, ForeignKey('user.user_id'))
    rated_id = Column(Integer, ForeignKey('user.user_id'))
    rating = Column(Integer, CheckConstraint('rating BETWEEN 1 AND 5'), nullable=False)

    # Relationships
    rater = relationship("User", foreign_keys=[rater_id], back_populates="student_ratings")
    rated = relationship("User", foreign_keys=[rated_id])

# Database connection details
DB_USERNAME = 'dbadmin'
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')

# Set up the connection to the AWS RDS PostgreSQL instance
engine = create_engine(f'postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}')

with engine.connect() as connection:
    connection.execute(text('DROP SCHEMA public CASCADE;'))
    connection.execute(text('CREATE SCHEMA public;'))

# Create all tables in the database
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()

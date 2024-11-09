from sqlalchemy.orm import sessionmaker
from models import User, Skills, Tags, UserSkills, SkillsTags, FluencyLevel, CommunityRatings, TeacherRatings, StudentRatings, UserGoals, engine
import random
from sqlalchemy import func
import hashlib

# Create a new session
Session = sessionmaker(bind=engine)
session = Session()

def create_users():
    user_data = [
        {'email': 'alice@example.com', 'password': 'password123', 'display_name': 'Alice'},
        {'email': 'bob@example.com', 'password': 'securepassword', 'display_name': 'Bob'},
        {'email': 'charlie@example.com', 'password': 'mypassword', 'display_name': 'Charlie'},
        {'email': 'diana@example.com', 'password': 'passw0rd', 'display_name': 'Diana'},
    ]
    users = []
    for data in user_data:
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        user = User(
            email=data['email'],
            password_hash=password_hash,
            display_name=data['display_name']
        )
        session.add(user)
        users.append(user)
    session.commit()
    return users

def create_skills():
    skill_names = ["Python", "JavaScript", "Data Analysis", "Machine Learning"]
    skills = []
    for skill_name in skill_names:
        skill = Skills(skill_name=skill_name)
        session.add(skill)
        skills.append(skill)
    session.commit()
    return skills

def create_tags():
    tag_names = ["Programming", "Data Science", "Web Development", "AI"]
    tags = []
    for tag_name in tag_names:
        tag = Tags(tag_name=tag_name)
        session.add(tag)
        tags.append(tag)
    session.commit()
    return tags

def associate_skills_tags(skills, tags):
    for skill in skills:
        associated_tags = random.sample(tags, k=2)  # Each skill gets 2 random tags
        for tag in associated_tags:
            skill_tag = SkillsTags(skill_id=skill.skill_id, tag_id=tag.tag_id)
            session.add(skill_tag)
    session.commit()

def associate_user_skills(users, skills):
    fluency_levels = [FluencyLevel.beginner, FluencyLevel.medium, FluencyLevel.advanced]
    for user in users:
        associated_skills = random.sample(skills, k=2)  # Each user gets 2 random skills
        for skill in associated_skills:
            user_skill = UserSkills(
                user_id=user.user_id,
                skill_id=skill.skill_id,
                fluency_level=random.choice(fluency_levels)
            )
            session.add(user_skill)
    session.commit()

def create_user_goals(users, skills):
    """Assigns random skills as goals for each user."""
    for user in users:
        goal_skills = random.sample(skills, k=2)  # Each user gets 2 random goal skills
        for skill in goal_skills:
            user_goal = UserGoals(
                user_id=user.user_id,
                skill_id=skill.skill_id
            )
            session.add(user_goal)
    session.commit()

def create_community_ratings(users):
    for rater in users:
        others = [u for u in users if u.user_id != rater.user_id]
        rated_user = random.choice(others)
        rating = random.randint(1, 5)
        community_rating = CommunityRatings(
            rater_id=rater.user_id,
            rated_id=rated_user.user_id,
            rating=rating
        )
        session.add(community_rating)
    session.commit()

def create_teacher_ratings(users):
    for rater in users:
        others = [u for u in users if u.user_id != rater.user_id]
        rated_user = random.choice(others)
        rating = random.randint(1, 5)
        teacher_rating = TeacherRatings(
            rater_id=rater.user_id,
            rated_id=rated_user.user_id,
            rating=rating
        )
        session.add(teacher_rating)
    session.commit()


def associate_user_goals(users, skills):
    """Assigns each user 2 random goal skills they want to learn."""
    for user in users:
        goal_skills = random.sample(skills, k=2)  # Each user gets 2 random goal skills
        for skill in goal_skills:
            user_goal = UserGoals(
                user_id=user.user_id,
                skill_id=skill.skill_id
            )
            session.add(user_goal)
    session.commit()

    
def create_student_ratings(users):
    for rater in users:
        others = [u for u in users if u.user_id != rater.user_id]
        rated_user = random.choice(others)
        rating = random.randint(1, 5)
        student_rating = StudentRatings(
            rater_id=rater.user_id,
            rated_id=rated_user.user_id,
            rating=rating
        )
        session.add(student_rating)
    session.commit()

def populate_database():
    users = create_users()
    skills = create_skills()
    tags = create_tags()
    associate_skills_tags(skills, tags)
    associate_user_skills(users, skills)
    create_user_goals(users, skills)  # Add goals for each user
    create_community_ratings(users)
    create_teacher_ratings(users)
    create_student_ratings(users)

if __name__ == "__main__":
    populate_database()
    session.close()

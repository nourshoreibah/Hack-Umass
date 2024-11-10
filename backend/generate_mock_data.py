# generate_mock_data.py
from models import User, Skills, UserSkills, UserGoals, FluencyLevel, CommunityRatings, session
import random
import hashlib
from typing import List

# List of 500 unique names
NAMES = [f"User{i}" for i in range(500)]

def get_or_create_skills() -> List[Skills]:
    # Get existing skills from database
    existing_skills = session.query(Skills).all()
    if (existing_skills):
        return existing_skills
    
    # If no skills exist, create default ones
    default_skills = [
        "Python", "JavaScript", "Java", "C#", "C++", "SQL", 
        "React", "Node.js", "DevOps", "Machine Learning"
    ]
    skills = []
    for skill_name in default_skills:
        skill = Skills(skill_name=skill_name)
        session.add(skill)
        skills.append(skill)
    session.commit()
    return skills


def create_users() -> List[User]:
    users = []
    for i, name in enumerate(NAMES):
        email = f"{name.lower()}@example.com"

        # Check if a user with the same email already exists in the database
        existing_user = session.query(User).filter_by(email=email).first()
        if existing_user:
            print(f"User with email {email} already exists. Skipping...")
            continue  # Skip creating this user if they already exist
        
        # If the user doesn't exist, create and add to the session
        user = User(
            email=email,
            password_hash=hashlib.sha256("password123".encode()).hexdigest(),
            display_name=name
        )
        session.add(user)
        users.add(user)

    # Commit changes after all users are processed
    session.commit()
    return users

def assign_skills_and_goals(users: List[User], skills: List[Skills]):
    # Weighted distribution for number of skills (1-5)
    skill_counts = [1, 2, 3, 3, 3, 4, 4, 5]  # More weight on 3-4 skills
    fluency_levels = [FluencyLevel.beginner, FluencyLevel.medium, FluencyLevel.medium, 
                     FluencyLevel.advanced]  # More weight on medium

    for user in users:
        # Assign skills
        num_skills = random.choice(skill_counts)
        user_skills = random.sample(skills, num_skills)
        for skill in user_skills:
            user_skill = UserSkills(
                user_id=user.user_id,
                skill_id=skill.skill_id,
                fluency_level=random.choice(fluency_levels)
            )
            session.add(user_skill)
        
        # Assign goals (from skills user doesn't have)
        available_goals = [s for s in skills if s not in user_skills]
        num_goals = random.randint(2, 4)
        goal_skills = random.sample(available_goals, num_goals)
        for skill in goal_skills:
            goal = UserGoals(user_id=user.user_id, skill_id=skill.skill_id)
            session.add(goal)
    
    session.commit()

def create_ratings(users: List[User]):
    rating_weights = [1, 2, 3, 3, 3, 4, 4, 5]  # Normal-ish distribution

    for rater in users:
        # Rate ~30% of other users
        num_to_rate = len(users) // 3
        rated_users = random.sample([u for u in users if u != rater], num_to_rate)
        
        for rated in rated_users:
            rating = random.choice(rating_weights)
            community_rating = CommunityRatings(
                rater_id=rater.user_id,
                rated_id=rated.user_id,
                rating=rating
            )
            session.add(community_rating)
    
    session.commit()

def generate_mock_data():
    print("Getting skills from database...")
    skills = get_or_create_skills()
    
    print(f"Found {len(skills)} skills")
    # Rest of the function remains the same...
    
    print("Creating users...")
    users = create_users()
    
    print("Assigning skills and goals...")
    assign_skills_and_goals(users, skills)
    
    print("Creating ratings...")
    create_ratings(users)
    
    print("Mock data generation complete!")

if __name__ == "__main__":
    generate_mock_data()
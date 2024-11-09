
# Define the AWS provider
provider "aws" {
  region = "us-east-1"  
}

# Security group to allow inbound access on port 5432
resource "aws_security_group" "rds_sg" {
  name        = "skilltrade-rds-sg"
  description = "Allow inbound access to RDS instance"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create an RDS instance for the relational database
resource "aws_db_instance" "skilltradeDB" {
  identifier             = "skilltrade-db"
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = "dbadmin"
  password               = var.db_password  
  publicly_accessible    = true
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.rds_sg.id] # Attach the security group
}

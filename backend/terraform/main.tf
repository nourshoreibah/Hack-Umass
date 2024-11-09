# Create an RDS instance for the relational database
resource "aws_db_instance" "skilltradeDB" {
  identifier       = "astronaut-db"
  engine           = "postgres"
  instance_class   = "db.t3.micro"
  allocated_storage = 20
  username         = "dbadmin"
  publicly_accessible    = true
  password         = var.db_password  
  skip_final_snapshot = true
}

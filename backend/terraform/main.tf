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



  resource "tls_private_key" "my_devtrade_key" {
    algorithm = "RSA"
    rsa_bits  = 2048
  }

  resource "aws_key_pair" "ec2_devtrade_key_pair" {
    key_name   = "devtrade-keypair"
    public_key = tls_private_key.my_devtrade_key.public_key_openssh
  }

  # Save the private key locally
  output "private_key" {
    value     = tls_private_key.my_devtrade_key.private_key_pem
    sensitive = true  # Marks this output as sensitive, hiding it in the CLI output
  }

  output "ec2_public_ip" {
    description = "The public IP address of the EC2 instance"
    value       = aws_instance.devtrade_server.public_ip
  }


  # Create an EC2 instance for hosting the API server
  resource "aws_instance" "devtrade_server" {
    ami                  = "ami-007868005aea67c54"  
    instance_type        = "t3.micro"
    security_groups      = [aws_security_group.api_sg.name]
    key_name             = aws_key_pair.ec2_devtrade_key_pair.key_name



  }


  # Security group for the EC2 instance
  resource "aws_security_group" "api_sg" {
    name = "devtrade-api-security-group"

    ingress {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }

    # Allow SSH access from anywhere (0.0.0.0/0)
    # For better security, replace "0.0.0.0/0" with your specific IP range
    ingress {
      from_port   = 22
      to_port     = 22
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
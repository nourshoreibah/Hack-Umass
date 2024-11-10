
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


  user_data = <<-EOF
            #!/bin/bash
            # Update the server
            sudo yum update -y

            # Install Git and other prerequisites
            sudo yum install -y git

            # Clone the repository
            mkdir -p /var/www
            cd /var/www
            git clone https://github.com/nourshoreibah/Hack-Umass.git
            cd Hack-Umass
            sudo chown -R ec2-user:ec2-user /var/www/Hack-Umass
            git checkout prodbranch
            git pull

            # Install Python 3.8 and set up virtual environment
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y openssl-devel bzip2-devel libffi-devel zlib-devel wget
            cd /usr/src

            sudo wget https://www.python.org/ftp/python/3.9.16/Python-3.9.16.tgz
            sudo tar xzf Python-3.9.16.tgz
            cd Python-3.9.16
            sudo ./configure --enable-optimizations
            sudo make altinstall

            python3.9 -m venv /var/www/Hack-Umass/backend/venv

            # Activate virtual environment and install backend dependencies
            source /var/www/Hack-Umass/backend/venv/bin/activate
            cd /var/www/Hack-Umass/backend
            pip install --upgrade pip
            pip install -r requirements.txt

            # Run Gunicorn for the Flask app
            /var/www/Hack-Umass/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app --daemon

            # Install Node.js, npm, and build frontend
            curl -sL https://rpm.nodesource.com/setup_16.x | bash -
            yum install -y nodejs
            cd /var/www/Hack-Umass/frontend
            npm install
            npm run build

            # Install and configure Nginx
            amazon-linux-extras install nginx1 -y
            systemctl start nginx
            systemctl enable nginx

            # Copy frontend build files to Nginx html directory
            cp -r /var/www/Hack-Umass/frontend/build/* /usr/share/nginx/html/

            # Configure Nginx to serve the backend at /api and frontend from the root
            cat > /etc/nginx/nginx.conf <<EOL
            events {}
            http {
                include /etc/nginx/mime.types;
                server {
                    listen 80;
                    server_name devtrade.tech;

                    # Redirect HTTP to HTTPS
                    return 301 https://$host$request_uri;
                }

                server {
                    listen 443 ssl;
                    server_name devtrade.tech;

                    # SSL certificate configuration (managed by Certbot)
                    ssl_certificate /etc/letsencrypt/live/devtrade.tech/fullchain.pem;
                    ssl_certificate_key /etc/letsencrypt/live/devtrade.tech/privkey.pem;

                    # Serve the frontend build
                    location / {ƒ
                        root /usr/share/nginx/html;
                        try_files $uri /index.html;
                    }

                    # Proxy requests to the backend
                    location /api {
                        proxy_pass http://127.0.0.1:5000;ß
                        proxy_set_header Host $host;
                        proxy_set_header X-Real-IP $remote_addr;
                        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                        proxy_set_header X-Forwarded-Proto $scheme;
                    }
                }
            }
            EOL

            # Install Certbot and request SSL certificate
            amazon-linux-extras install epel -y
            yum install -y certbot
            /usr/local/bin/pip3 install certbot-nginx

            # Request SSL certificate
            certbot --nginx -d devtrade.tech --non-interactive --agree-tos -m shoreibah.n@northeastern.edu

            # Set up a cron job for auto-renewing the certificate
            echo "0 0 * * * /usr/bin/certbot renew --quiet" | crontab -

            # Restart Nginx to apply the configuration
            systemctl restart nginx
EOF

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
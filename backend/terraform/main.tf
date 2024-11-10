
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
            sudo yum install -y nodejs
            cd /var/www/Hack-Umass/frontend
            sudo npm install
            npx expo export -p web


            # Install and configure Nginx
            amazon-linux-extras install nginx1 -y
            sudo yum install -y nginx
            systemctl start nginx
            systemctl enable nginx

            # Copy frontend build files to Nginx html directory
            cp -r /var/www/Hack-Umass/frontend/build/* /usr/share/nginx/html/

            # Configure Nginx to serve the backend at /api and frontend from the root
            cat > /etc/nginx/nginx.conf <<EOL
            server {
                listen 80;
                server_name devtrade.tech;
                return 301 https://$host$request_uri;
            }

            server {
                listen 443 ssl;
                server_name devtrade.tech;

                ssl_certificate /etc/nginx/ssl/devtrade.tech.crt;
                ssl_certificate_key /etc/nginx/ssl/devtrade.tech.key;

                root /var/www/Hack-Umass/frontend/dist;
                index index.html;

                location / {
                    try_files $uri /index.html;
                    expires 1d;
                    add_header Cache-Control "public, max-age=86400";
                }

                # Optional: Proxy API requests to backend
                location /api/ {
                    proxy_pass http://127.0.0.1:5000/;  # Adjust the backend port as necessary
                    proxy_http_version 1.1;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_cache_bypass $http_upgrade;
                }

                # Optional: Enable gzip compression
                gzip on;
                gzip_types text/plain application/javascript text/css application/json image/svg+xml;
            }

            EOL

            # Obtain SSL certificate
            cd ~
            curl https://get.acme.sh | sh
            source ~/.acme.sh/acme.sh.env
            ~/.acme.sh/acme.sh --issue --webroot /var/www/Hack-Umass/frontend/dist -d devtrade.tech --email shoreibah.n@northeastern.edu 
            sudo mkdir -p /etc/nginx/ssl









            # Request SSL certificate
            sudo certbot --nginx -d devtrade.tech --non-interactive --agree-tos -m shoreibah.n@northeastern.edu


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
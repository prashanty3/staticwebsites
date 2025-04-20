pipeline {
    agent any

    environment {
        FTP_SERVER = 'shobhityadav.com'
        FTP_USERNAME = 'u964324091'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.'
        REMOTE_DIR = 'public_html'
    }

    stages {
        stage('Checkout Code') {
            steps { 
                git credentialsId: 'github-token-new-new', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Security Scan (Optional)') {
            steps {
                echo "🔍 Skipping security scan — no dependencies"
            }
        }

        stage('Prepare Deployment') {
            steps {
                sh '''
                echo "📂 Verifying workspace contents:"
                ls -la
                
                # Ensure index.html exists
                if [ ! -f index.html ] && [ ! -f Index.html ]; then
                    echo "⚠️ Warning: No index.html found in root directory"
                    find . -name "index.html" -o -name "Index.html"
                fi
                '''
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh '''
                if ! command -v lftp > /dev/null 2>&1; then
                    echo "❌ 'lftp' is not installed. Installing now..."
                    apt-get update && apt-get install -y lftp || yum install -y lftp
                fi

                echo "🔐 Connecting to FTP server..."
                
                # Create a temporary lftp script with proper error handling
                cat > deploy.lftp << EOF
                open -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" 
                set ssl:verify-certificate no
                set ftp:ssl-allow yes
                set ftp:ssl-force yes
                set ftp:ssl-protect-data yes
                set net:timeout 10
                set net:max-retries 3
                set net:reconnect-interval-base 5
                set net:reconnect-interval-multiplier 1
                
                # Debug - check remote directory contents
                ls -la $REMOTE_DIR
                
                # Upload files with better sync options
                mirror -R --parallel=5 --verbose=3 --delete --ignore-time --no-perms "$LOCAL_DIR" "$REMOTE_DIR"
                
                # Verify upload
                ls -la $REMOTE_DIR
                
                bye
                EOF
                
                # Execute the script
                lftp -f deploy.lftp || (echo "❌ FTP upload failed" && exit 1)
                
                echo "✅ Files uploaded successfully"
                '''
            }
        }

        stage('Post-Deployment Verification') {
            steps {
                sh '''
                echo "🔍 Verifying deployment..."
                curl -s -I "http://$FTP_SERVER" || echo "⚠️ Could not verify site is up"
                echo "🚀 Deployment completed!"
                '''
            }
        }
    }
    
    post {
        success {
            echo "✅ Pipeline executed successfully!"
        }
        failure {
            echo "❌ Pipeline failed, check logs for details"
        }
    }
}
pipeline {
    agent any

    environment {
        // Using specific FTP_HOST instead of domain name
        FTP_HOST = 'ftp.shobhityadav.com' // Try this instead of shobhityadav.com
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

        stage('Prepare Deployment') {
            steps {
                sh '''
                echo "📂 Verifying workspace contents:"
                ls -la
                echo "Creating test file..."
                echo "Test file from Jenkins - $(date)" > test_file.txt
                '''
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh '''
                echo "🔄 Creating LFTP script with SSL verification disabled..."
                
                # Create simple LFTP script
                cat > deploy.lftp << EOF
                set ssl:verify-certificate no
                set ftp:ssl-allow yes
                set ftp:ssl-protect-data yes
                open -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_HOST"
                pwd
                ls -la
                mirror -R --verbose=3 --delete "$LOCAL_DIR" "$REMOTE_DIR"
                bye
                EOF
                
                # Execute LFTP script
                lftp -f deploy.lftp
                
                echo "✅ LFTP deployment completed"
                '''
            }
        }
        
        stage('Try Alternative Deployment') {
            when {
                expression { currentBuild.result == 'FAILURE' || true }
            }
            steps {
                sh '''
                echo "🔄 Trying simple FTP upload with curl..."
                
                # Upload index.html as test
                curl -v --ftp-ssl-reqd --insecure --ssl-reqd \
                     --user "$FTP_USERNAME:$FTP_PASSWORD" \
                     -T "index.html" \
                     "ftp://$FTP_HOST/$REMOTE_DIR/"
                
                # Upload test file
                curl -v --ftp-ssl-reqd --insecure --ssl-reqd \
                     --user "$FTP_USERNAME:$FTP_PASSWORD" \
                     -T "test_file.txt" \
                     "ftp://$FTP_HOST/$REMOTE_DIR/"
                     
                echo "✅ Curl deployment completed"
                '''
            }
        }
    }
    
    post {
        always {
            echo "💡 Troubleshooting information:"
            echo "1. The main issue appears to be SSL certificate verification problems"
            echo "2. Try using 'ftp.shobhityadav.com' instead of 'shobhityadav.com'"
            echo "3. Alternatively, log into Hostinger control panel to verify correct FTP hostname"
            echo "4. Consider creating a simple FTP deploy script outside Jenkins to test credentials"
        }
    }
}
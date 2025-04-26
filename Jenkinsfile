pipeline {
    agent any

    environment {
        FTP_HOST = 'ftp.shobhityadav.com:21' // Confirm port (21 for FTP, 990 for FTPS)
        FTP_USERNAME = 'u964324091'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.'
        REMOTE_DIR = '' // Correct: Hostinger's FTP root is public_html
        SITE_URL = 'https://shobhityadav.com'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-token', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Prepare Deployment') {
            steps {
                sh '''
                echo "📂 Verifying workspace contents:"
                ls -la

                echo "Creating test file..."
                echo "Test file from Jenkins - $(date)" > test_file.txt

                # Set correct permissions
                find . -type f \( -iname "*.html" -o -iname "*.css" -o -iname "*.js" -o -iname "*.jpg" -o -iname "*.png" -o -iname "*.gif" \) -exec chmod 644 {} \;
                '''
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh '''
                echo "🔄 Deploying files to Hostinger FTP..."

                # Upload files with passive mode
                find . -type f \( -iname "*.html" -o -iname "*.css" -o -iname "*.js" -o -iname "*.jpg" -o -iname "*.png" -o -iname "*.gif" -o -iname "test_file.txt" \) | while read file; do
                    REMOTE_PATH=${file#./}
                    echo "Uploading $file to $REMOTE_PATH ..."
                    curl --ftp-ssl-reqd --ftp-pasv --ftp-create-dirs --user "$FTP_USERNAME:$FTP_PASSWORD" \
                        -T "$file" \
                        "ftp://$FTP_HOST/$REMOTE_PATH"
                done

                echo "✅ Deployment completed successfully."
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                echo "🔍 Verifying deployment..."
                sleep 5

                # Check main page
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")

                if [ "$HTTP_CODE" -eq 200 ]; then
                    echo "✅ Website is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Website returned HTTP code: $HTTP_CODE"
                fi

                # Check test file
                TEST_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/test_file.txt")

                if [ "$TEST_CODE" -eq 200 ]; then
                    echo "✅ Test file is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Test file returned HTTP code: $TEST_CODE"
                fi
                '''
            }
        }
    }

    post {
        always {
            echo "💡 Troubleshooting info:"
            echo "1. Check files via Hostinger File Manager"
            echo "2. Verify 'public_html' is the correct document root"
            echo "3. Ensure 'index.html' is at the root level"
            echo "4. Clear browser cache or use incognito"
        }
        success {
            echo "✅ Deployment successful. If issues, clear Hostinger cache and check DNS settings."
        }
        failure {
            echo "❌ Deployment failed. Review the logs above carefully."
        }
    }
}
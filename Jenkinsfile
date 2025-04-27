pipeline {
    agent any

    environment {
        // Using specific FTP details
        FTP_HOST = 'ftp.shobhityadav.com'
        FTP_USERNAME = 'u964324091.shobhit'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.'
        REMOTE_DIR = '.'
        SITE_URL = 'https://shobhityadav.com' // For verification
    }

    stages {
        stage('Checkout Code') {
            steps { 
                git credentialsId: 'github-token', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                script {
                    echo "🔄 Deploying entire GitHub repository to Hostinger FTP..."

                    // Use the entire repository and upload it
                    sh '''
                    # Upload all files and directories from the current directory
                    echo "Uploading all files from the repository..."
                    find . -type f | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --ftp-create-dirs --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/$REMOTE_DIR/$(basename "$file")"
                    done
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "🔍 Verifying deployment..."

                    // Wait for a short period to allow deployment to complete
                    sleep 5

                    // Check if the website is accessible
                    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")

                    if [ "$HTTP_CODE" -eq 200 ]; then
                        echo "✅ Website is accessible (HTTP 200 OK)"
                    else
                        echo "⚠️ Website returned HTTP code: $HTTP_CODE"
                        echo "This might indicate a server configuration issue."
                    fi
                }
            }
        }
    }
    
    post {
        always {
            echo "💡 Troubleshooting information:"
            echo "1. Verify files were uploaded correctly by checking the Hostinger File Manager"
            echo "2. Check if the website is using the correct document root (public_html)"
            echo "3. If the website shows 'It feels lonely here...', the file structure may be incorrect"
            echo "4. Make sure index.html is in the root of public_html directory"
            echo "5. Clear browser cache and try accessing the site in incognito mode"
        }
        success {
            echo "✅ Deployment appears successful. If the site still doesn't display correctly:"
            echo "   - Try purging the Hostinger cache from the control panel"
            echo "   - Verify DNS settings are pointing to the correct hosting"
        }
        failure {
            echo "❌ Deployment failed. Check the logs above for specific errors."
        }
    }
}

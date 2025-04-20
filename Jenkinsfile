pipeline {
    agent any

    environment {
        // Using specific FTP details
        FTP_HOST = 'ftp.shobhityadav.com'
        FTP_USERNAME = 'u964324091'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.'
        REMOTE_DIR = 'public_html'
        SITE_URL = 'https://shobhityadav.com' // For verification
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
                
                # Ensure all files have proper permissions
                find . -type f -name "*.html" -exec chmod 644 {} \\;
                find . -type f -name "*.css" -exec chmod 644 {} \\;
                find . -type f -name "*.js" -exec chmod 644 {} \\;
                find . -type f -name "*.jpg" -exec chmod 644 {} \\;
                find . -type f -name "*.png" -exec chmod 644 {} \\;
                find . -type f -name "*.gif" -exec chmod 644 {} \\;
                '''
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh '''
                echo "🔄 Deploying with curl method (more reliable)..."
                
                # First make sure the target directory exists
                curl --ftp-ssl-reqd --insecure --ssl-reqd \
                     --user "$FTP_USERNAME:$FTP_PASSWORD" \
                     -Q "MKD $REMOTE_DIR" \
                     "ftp://$FTP_HOST/"
                
                # Upload HTML files
                find . -type f -name "*.html" | while read file; do
                    echo "Uploading $file..."
                    curl --ftp-ssl-reqd --insecure --ssl-reqd \
                         --user "$FTP_USERNAME:$FTP_PASSWORD" \
                         -T "$file" \
                         "ftp://$FTP_HOST/$REMOTE_DIR/$(basename $file)"
                done
                
                # Upload CSS files
                find ./css -type f -name "*.css" 2>/dev/null | while read file; do
                    echo "Uploading $file..."
                    curl --ftp-ssl-reqd --insecure --ssl-reqd \
                         --user "$FTP_USERNAME:$FTP_PASSWORD" \
                         -Q "MKD $REMOTE_DIR/css" \
                         "ftp://$FTP_HOST/" || true
                    curl --ftp-ssl-reqd --insecure --ssl-reqd \
                         --user "$FTP_USERNAME:$FTP_PASSWORD" \
                         -T "$file" \
                         "ftp://$FTP_HOST/$REMOTE_DIR/css/$(basename $file)"
                done
                
                # Upload JS files
                find ./js -type f -name "*.js" 2>/dev/null | while read file; do
                    echo "Uploading $file..."
                    curl --ftp-ssl-reqd --insecure --ssl-reqd \
                         --user "$FTP_USERNAME:$FTP_PASSWORD" \
                         -Q "MKD $REMOTE_DIR/js" \
                         "ftp://$FTP_HOST/" || true
                    curl --ftp-ssl-reqd --insecure --ssl-reqd \
                         --user "$FTP_USERNAME:$FTP_PASSWORD" \
                         -T "$file" \
                         "ftp://$FTP_HOST/$REMOTE_DIR/js/$(basename $file)"
                done
                
                # Upload image files (create directory first)
                if [ -d "./images" ]; then
                    curl --ftp-ssl-reqd --insecure --ssl-reqd \
                         --user "$FTP_USERNAME:$FTP_PASSWORD" \
                         -Q "MKD $REMOTE_DIR/images" \
                         "ftp://$FTP_HOST/" || true
                         
                    find ./images -type f -name "*.jpg" -o -name "*.png" -o -name "*.gif" | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --insecure --ssl-reqd \
                             --user "$FTP_USERNAME:$FTP_PASSWORD" \
                             -T "$file" \
                             "ftp://$FTP_HOST/$REMOTE_DIR/images/$(basename $file)"
                    done
                fi
                
                # Upload test file to verify deployment
                curl --ftp-ssl-reqd --insecure --ssl-reqd \
                     --user "$FTP_USERNAME:$FTP_PASSWORD" \
                     -T "test_file.txt" \
                     "ftp://$FTP_HOST/$REMOTE_DIR/test_file.txt"
                     
                echo "✅ Curl deployment completed"
                '''
            }
        }
        
        stage('Verify Deployment') {
            steps {
                sh '''
                echo "🔍 Verifying deployment..."
                # Wait a moment for files to be properly processed
                sleep 5
                
                # Check if we can access the main page
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
                
                if [ "$HTTP_CODE" -eq 200 ]; then
                    echo "✅ Website is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Website returned HTTP code: $HTTP_CODE"
                    echo "This might indicate a server configuration issue."
                fi
                
                # Check if our test file is accessible
                TEST_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/test_file.txt")
                
                if [ "$TEST_CODE" -eq 200 ]; then
                    echo "✅ Test file is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Test file returned HTTP code: $TEST_CODE"
                    echo "This might indicate a server configuration issue."
                fi
                '''
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
            echo "   - Try purging the Hostinger cache from control panel"
            echo "   - Verify DNS settings are pointing to the correct hosting"
        }
        failure {
            echo "❌ Deployment failed. Check the logs above for specific errors."
        }
    }
}
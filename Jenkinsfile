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
                find . -type f -name "*.ico" -exec chmod 644 {} \\;
                '''
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh '''
                echo "🔄 Deploying files to Hostinger FTP..."

                # Upload HTML files
                find . -type f -name "*.html" | while read file; do
                    echo "Uploading $file..."
                    curl --ftp-ssl-reqd --ftp-create-dirs --insecure \
                        --user "$FTP_USERNAME:$FTP_PASSWORD" \
                        -T "$file" \
                        "ftp://$FTP_HOST/$REMOTE_DIR/$(basename "$file")"
                done

                # Upload CSS files
                if [ -d "./css" ]; then
                    find ./css -type f -name "*.css" | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --ftp-create-dirs --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/$REMOTE_DIR/css/$(basename "$file")"
                    done
                fi

                # Upload JS files
                if [ -d "./js" ]; then
                    find ./js -type f -name "*.js" | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --ftp-create-dirs --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/$REMOTE_DIR/js/$(basename "$file")"
                    done
                fi

                # Upload images
                if [ -d "./images" ]; then
                    find ./images -type f \\( -iname "*.jpg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.ico"\\) | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --ftp-create-dirs --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/$REMOTE_DIR/images/$(basename "$file")"
                    done
                fi

                # Upload test file
                echo "Uploading test file..."
                curl --ftp-ssl-reqd --ftp-create-dirs --insecure \
                    --user "$FTP_USERNAME:$FTP_PASSWORD" \
                    -T "test_file.txt" \
                    "ftp://$FTP_HOST/$REMOTE_DIR/test_file.txt"

                echo "✅ Deployment completed successfully."
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                echo "🔍 Verifying deployment..."
                sleep 5
                
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
                
                if [ "$HTTP_CODE" -eq 200 ]; then
                    echo "✅ Website is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Website returned HTTP code: $HTTP_CODE"
                    echo "This might indicate a server configuration issue."
                fi
                
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

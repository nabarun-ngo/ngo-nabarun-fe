

# Checkout stage branch
Write-Host "Checking out 'stage' branch..."
git checkout stage
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pulling latest changes..."
git pull origin stage
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }


Write-Host "Running app..."
npm run start
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Checkout stage branch
Write-Host "Checking out 'stage' branch..."
git checkout stage
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pulling latest changes..."
git pull origin stage
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Installing dependencies"
npm ci

Write-Host "Building & Starting Angular application:"
npm run start 
# Angular Build Speed Optimization Guide

## 🚀 Quick Commands
- `npm run build:fast` - Optimized development build
- `npm run serve:fast` - Fast development server
- `npm run watch` - Auto-rebuild on changes (fastest for development)

## ⚙️ Applied Optimizations

### TypeScript Optimizations
- ✅ Incremental compilation enabled
- ✅ Skip library type checking
- ✅ Build info caching
- ✅ ES2022 target for better performance

### Angular Build Optimizations
- ✅ Vendor chunk separation (faster subsequent builds)
- ✅ Common chunk enabled
- ✅ Named chunks for better caching
- ✅ AOT disabled for development
- ✅ Source maps disabled for development
- ✅ Build optimizer disabled for development

## 🔧 System-Level Optimizations (Manual)

### 1. Node.js Memory Optimization
Add to your system environment variables:
```
NODE_OPTIONS=--max-old-space-size=2048
```

### 2. Windows Antivirus Exclusions
Add these folders to Windows Defender exclusions:
- `C:\Users\Souvik\Nabarun-Workspace\ngo-nabarun-fe`
- `C:\Users\Souvik\AppData\Roaming\npm`
- `C:\Users\Souvik\AppData\Local\npm-cache`

### 3. NPM Cache Optimization
```bash
npm config set cache-min 86400
npm config set fund false
npm config set audit false
```

### 4. Use SSD for Better I/O
- Ensure project is on SSD drive (not HDD)
- Consider moving npm cache to SSD

## 📊 Performance Expectations

### Your System (4GB RAM, 2 cores):
- **Development build**: ~3-5 minutes
- **Watch mode**: ~30-60 seconds (after initial build)
- **Serve mode**: ~20-30 seconds (after initial build)

### Build Time Comparison:
- **Full build**: ~5-10 minutes
- **Fast build**: ~3-5 minutes  
- **Watch mode**: ~30-60s (incremental)

## 🎯 Development Workflow Recommendations

1. **Use watch mode during development:**
   ```bash
   npm run watch
   ```

2. **Use serve mode for testing:**
   ```bash
   npm run serve:fast
   ```

3. **Only use full builds for deployment:**
   ```bash
   npm run build        # Production
   npm run build:stage  # Staging
   ```

## 🔍 Monitoring Build Performance

### Check build times:
```bash
# With timing
time npm run build:fast

# With detailed webpack stats
ng build --configuration development --stats-json
```

### Memory usage during build:
- Task Manager > Performance > Memory
- Should stay under 3.5GB to avoid swapping

## ⚠️ Known Limitations

With 4GB RAM system:
- Large Angular projects may cause memory pressure
- Consider closing other applications during builds
- Swap file usage may slow builds significantly

## 🔄 Cache Management

### Clear caches if builds are inconsistent:
```bash
# Clear Angular cache
ng cache clean

# Clear npm cache
npm cache clean --force

# Clear TypeScript cache
rm .tsbuildinfo
rm -rf dist/

# Full reset
rm -rf node_modules package-lock.json
npm install
```

# Hero Video Optimization - Critical Bug Fix

## Problem Identified

The Hero component was loading **6 videos (21.49 MB total)** simultaneously on page load, causing:
- **LCP: 10.6s** (target: <2.5s)
- **Performance Score: 38/100** (target: >80)
- **Network payload: 22 MB** (excessive)

## Root Cause - Critical Bug

The lazy loading implementation had a **critical bug** in the autoplay logic:

```typescript
// ❌ WRONG - All loaded videos autoplay simultaneously
autoPlay={shouldLoad}

// ✅ CORRECT - Only current video autoplays
autoPlay={isCurrentVideo && shouldLoad}
```

This caused a cascade effect where:
1. Video 0 loads and autoplays
2. Video 1 preloads and immediately autoplays (bug!)
3. Video 2 preloads and immediately autoplays (bug!)
4. All 6 videos end up loading and playing at once

## Solution Implemented

### 1. Fixed Autoplay Logic
Changed `autoPlay` to only activate for the currently visible video:
```typescript
autoPlay={isCurrentVideo && shouldLoad}
```

### 2. Manual Playback Control
Added explicit play/pause control to ensure only one video plays at a time:
```typescript
useEffect(() => {
  videoRefs.current.forEach((video, index) => {
    if (!video) return;
    
    if (index === currentVideoIndex && loadedVideos.has(index)) {
      video.play().catch(() => {
        // Ignore autoplay errors
      });
    } else {
      video.pause();
    }
  });
}, [currentVideoIndex, loadedVideos]);
```

### 3. Progressive Loading Strategy
- **First video** (1.mp4, 2.26 MB) loads immediately with `preload="metadata"`
- **Poster image** (`/og-image.png`) for instant LCP
- **Next video** preloads when current video is playing
- **Other videos** use `preload="none"` and only load when needed

## Expected Improvements

### Network Payload
- **Before**: 21.49 MB loaded immediately
- **After**: ~2.26 MB initially (89% reduction)

### LCP (Largest Contentful Paint)
- **Before**: 10.6s
- **Expected**: <3s (70% improvement)

### Performance Score
- **Before**: 38/100
- **Expected**: 60-70/100

## Testing

Run Lighthouse CI to verify improvements:
```bash
npm run lighthouse:ci
```

Expected metrics:
- Performance: 60-70/100 (up from 38)
- LCP: <3s (down from 10.6s)
- Network payload: <5 MB initial (down from 22 MB)

## Additional Recommendations

### 1. Video Compression
Current video sizes:
- 1.mp4: 2.26 MB ✓ (acceptable)
- 2.mp4: 2.42 MB ✓ (acceptable)
- 3.mp4: 4.19 MB ⚠️ (consider compressing)
- 4.mp4: 2.44 MB ✓ (acceptable)
- 5.mp4: 6.41 MB ❌ (needs compression - highest priority)
- 6.mp4: 3.77 MB ⚠️ (consider compressing)

Compress using ffmpeg:
```bash
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow output.mp4
```

### 2. Modern Video Formats
Consider WebM format for 50-70% better compression:
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus output.webm
```

Then use fallback strategy:
```tsx
<video>
  <source src="/hero/1.webm" type="video/webm" />
  <source src="/hero/1.mp4" type="video/mp4" />
</video>
```

### 3. Responsive Videos
Serve different video sizes based on viewport:
- Mobile: 720p
- Desktop: 1080p

## Files Modified

- `src/components/sections/Hero.tsx` - Fixed autoplay bug and added manual playback control

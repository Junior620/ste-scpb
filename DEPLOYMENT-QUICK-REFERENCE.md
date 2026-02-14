# Production Deployment - Quick Reference

**Task 23: Production deployment and monitoring**

## 🚀 Quick Commands

### Deploy to Production
```bash
npm run deploy:production
```

### Monitor Production
```bash
npm run monitor:production
```

### Verify Performance
```bash
npm run verify:performance
```

### Rollback (Emergency)
```bash
npm run rollback:production
```

## ✅ Pre-Deployment Checklist

- [ ] Staging validation complete
- [ ] All tests passing
- [ ] Performance targets met
- [ ] 24-hour monitoring done
- [ ] Stakeholder approval

## 🎯 Performance Targets

| Metric | Target |
|--------|--------|
| Real Experience Score | >90 |
| FCP | <2.5s |
| LCP | <2.5s |
| TTFB | <0.8s |
| Bundle | <200KB |

## 📊 Monitoring Resources

- **Vercel Analytics:** https://vercel.com/analytics
- **Speed Insights:** https://vercel.com/speed-insights
- **Metrics File:** `production-metrics.json`
- **Logs:** `production-monitor.log`

## 🚨 Alert Thresholds

- TTFB > 1s
- Uptime < 99.5%
- Error rate > 1%
- Component errors

## 🔄 Gradual Rollout

1. **0-1h:** 10% traffic
2. **1-2h:** 50% traffic
3. **2h+:** 100% traffic

## 📞 Emergency Contacts

If issues arise:
1. Check monitoring dashboard
2. Review error logs
3. Consider rollback
4. Contact team lead

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

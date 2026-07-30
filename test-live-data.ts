import { getLiveAnalysis } from './src/liveData.js';
getLiveAnalysis(new Date()).then(data => console.log(data.news)).catch(console.error);

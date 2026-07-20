const getMarketStatus = () => {
    const d = new Date();
    const mytTime = new Date(d.getTime() + 8 * 3600 * 1000);
    const day = mytTime.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = mytTime.getUTCHours();
    
    // Market closes Saturday 6:00 AM MYT
    // Market opens Monday 6:00 AM MYT
    
    if (day === 6 && hours >= 6) return false;
    if (day === 0) return false;
    if (day === 1 && hours < 6) return false;
    
    return true;
  };
console.log(getMarketStatus());

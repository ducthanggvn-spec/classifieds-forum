fetch('https://api.ttvnol.site/api/markets/hai-phong/heartbeat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'test', nickname: 'test' })
}).then(async res => {
  console.log(res.status);
  console.log(await res.text());
}).catch(console.error);

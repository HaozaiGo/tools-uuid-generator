module.exports = async (page, assert, lang) => {
  for (const version of [1,4,7]) {
    await page.selectOption('#uuid-version','v'+version);
    await page.fill('#uuid-count','100'); await page.click('[onclick="generateUUIDs()"]');
    const ids = (await page.inputValue('#uuid-output')).trim().split('\n');
    assert.equal(ids.length,100); assert.equal(new Set(ids).size,100);
    for (const id of ids) assert.match(id,new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`,'i'));
  }
  await page.fill('#uuid-count','-5'); await page.click('[onclick="generateUUIDs()"]');
  assert.equal(await page.inputValue('#uuid-count'),'1');
  await page.fill('#uuid-count','10001'); await page.click('[onclick="generateUUIDs()"]');
  assert.equal((await page.inputValue('#uuid-output')).split('\n').length,10000);
  await page.fill('#uuid-count','2'); await page.check('#opt-braces'); await page.check('#opt-quotes'); await page.check('#opt-commas');
  assert.equal(JSON.parse('[' + await page.inputValue('#uuid-output') + ']').length,2);
};

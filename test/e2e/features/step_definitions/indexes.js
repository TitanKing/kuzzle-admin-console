const { Given, When, Then } = require('cucumber')
const expect = require('expect.js')
const utils = require('../../utils')

Given('I have no indexes', async function() {
  const indexCount = await utils.$$eval(
    this.page,
    '.IndexBoxed',
    envs => envs.length
  )
  expect(indexCount).to.be(0)
})

Given(/The (empty )?indexes list is well-formed/, async function(empty) {
  const screenshotName =
    empty === 'empty' ? 'data.indexes.empty' : 'data.indexes.oneindex'
  const currentScreenshotPath = utils.getCurrentScreenshotPath(screenshotName)
  await utils.waitForSelector(this.page, '.IndexesPage')

  await utils.elementScreenshot(
    this.page,
    '.IndexesPage',
    currentScreenshotPath
  )
  await utils.compareScreenshot(screenshotName)
})

When(/I create a new index called (.*)/, async function(name) {
  await utils.click(this.page, '.IndexesPage-createBtn')

  await utils.waitForSelector(this.page, '.CreateIndexModal-name')
  await utils.type(this.page, '.CreateIndexModal-name', name)

  await utils.click(this.page, '.CreateIndexModal-createBtn')
})

When(/I delete the (.*) index/, async function(indexName) {
  await utils.click(
    this.page,
    `.IndexBoxed[title=${indexName}] .IndexBoxed-dropdown`
  )
  await utils.click(
    this.page,
    `.IndexBoxed[title=${indexName}] .IndexDropdown-delete`
  )

  await utils.waitForSelector(this.page, '.IndexDeleteModal-name')
  await utils.type(this.page, '.IndexDeleteModal-name', indexName)
  await utils.click(this.page, '.IndexDeleteModal-deleteBtn')
  await utils.wait(this.page, 2000)
})

Then(/I can(not)? see the (.*) index in the list/, async function(not, name) {
  await utils.selectorIsNotPresent(
    this.page,
    '.CreateIndexModal .modal-content'
  )

  const selector = `.IndexBoxed[title="${name}"]`

  if (not) {
    await utils.selectorIsNotPresent(selector)
  } else {
    await utils.waitForExist(selector)
  }
})

Then('I get an error in the index creation modal', async function() {
  await utils.waitForSelector(this.page, '.CreateIndexModal-error')
})

const fs = require('fs')
const Path = require('path')
const pug = require('pug')

const compiledFunction = pug.compileFile(Path.join(__dirname, 'template.pug'), {
  pretty: true,
})

const output = Path.join(__dirname, 'dist')

const getMessages = async () => {
  const path = Path.join(__dirname, 'messages')
  if (!fs.existsSync(path)) {
    return []
  }
  const files = await fs.promises.readdir(path, { withFileTypes: true })
  const messages = []
  for (let file of files) {
    if (file.isFile() || file.isSymbolicLink()) {
      const json = await fs.promises.readFile(Path.join(path, file.name), 'utf-8')
      const basename = Path.basename(file.name).split('.')
      messages.push({
        name: basename[0],
        data: JSON.parse(json)
      })
    }
  }
  return messages
}

const rm = async (path) => {
  const stat = await fs.promises.stat(path)
  if (stat.isDirectory()) {
    for (const file of await fs.promises.readdir(path)) {
      await rm(Path.join(path, file))
    }
    await fs.promises.rmdir(path)
  } else {
    await fs.promises.unlink(path)
  }
}

const globalData = {
  user: 'Hi, ${user}',
  logoLink: '${logoLink}',
  logoIcon: '${logo}',
  logoAlt: '${logoAlt}',
  noticeLink: '${noticeLink}',
  homeLink: '${homeLink}',
  rightArrowIcon: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAdUlEQVRIie2UOw5AUBBF79P5lLagtwgJnY6dKSxDrWFbJEelEZUYQt4pJ5N7iplcyeM5AyiAHgitBCWwAiMQWUkaYAEmIPmFZH5F4g6LnaTsoieXlEoanHP1Pgwuhj0L0Jod2zrc7k0P4fHd4ZVpVZiXnedbbIpkpU4/wM0hAAAAAElFTkSuQmCC`,
}

;(async () => {
  if (fs.existsSync(output)) {
    await rm(output)
  }
  await fs.promises.mkdir(output)
  const messages = await getMessages()
  for(const message of messages) {
    message.data = message.data || {}
    const html = compiledFunction({
      ...globalData,
      ...message.data
    })
    await fs.promises.writeFile(Path.join(output, message.name + '.html'), html, 'utf-8')
  }
})()

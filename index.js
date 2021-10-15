const fs = require('fs')
const Path = require('path')
const pug = require('pug')

const compiledFunction = pug.compileFile(Path.join(__dirname, 'template.pug'), {
  pretty: true,
})

const output = Path.join(__dirname, 'dist')

const getMessages = async () => {
  const path = Path.join(__dirname, 'messages')
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
  user: 'Dear, ${user}',
  logoLink: '${logoLink}',
  logoIcon: '${logo}',
  logoAlt: '${logoAlt}',
  rightArrowIcon: `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+b3BlbjwvdGl0bGU+CiAgICA8ZyBpZD0ib3BlbiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IuWPs+eureWktCIgZmlsbC1ydWxlPSJub256ZXJvIj4KICAgICAgICAgICAgPHJlY3QgaWQ9IuefqeW9oiIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMCIgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48L3JlY3Q+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMC43NDQ4MzU5LDExLjQ2OTY3OTcgTDE0LjcyNjY3MTksNS40NTE1MzkwNiBDMTQuNDMzNzk2OSw1LjE1ODY0MDYzIDEzLjk1ODkwNjIsNS4xNTg2NDA2MyAxMy42NjYwMzEyLDUuNDUxNTM5MDYgQzEzLjM3MzEzMjgsNS43NDQ0Mzc1IDEzLjM3MzEzMjgsNi4yMTkzMDQ2OSAxMy42NjYwMzEyLDYuNTEyMjAzMTMgTDE4LjQzMDg3NSwxMS4yNzcwNDY5IEwzLjcwMzcxMDk0LDExLjI3NzA0NjkgQzMuMzA0NDI5NjksMTEuMjc3MDQ2OSAyLjk4MDc1NzgxLDExLjYwMDc0MjIgMi45ODA3NTc4MSwxMiBDMi45ODA3NTc4MSwxMi4zOTkyODEzIDMuMzA0NDUzMTIsMTIuNzIyOTUzMSAzLjcwMzcxMDk0LDEyLjcyMjk1MzEgTDE4LjQzMDg5ODQsMTIuNzIyOTUzMSBMMTMuNjY2MDMxMiwxNy40ODc4MjAzIEMxMy4zNzMxMzI4LDE3Ljc4MDY5NTMgMTMuMzczMTMyOCwxOC4yNTU1ODU5IDEzLjY2NjAzMTIsMTguNTQ4NDg0NCBDMTMuODEyNDY4NywxOC42OTQ5MjE5IDE0LjAwNDQyMTksMTguNzY4MTQwNiAxNC4xOTYzNTE2LDE4Ljc2ODE0MDYgQzE0LjM4ODI4MTIsMTguNzY4MTQwNiAxNC41ODAyMzQ0LDE4LjY5NDkyMTkgMTQuNzI2NjcxOSwxOC41NDg0ODQ0IEwyMC43NDQ4MzU5LDEyLjUzMDMyMDMgQzIwLjg4NTQ4OCwxMi4zODk2NzE5IDIwLjk2NDUwNTgsMTIuMTk4OTA5NSAyMC45NjQ1MDU4LDEyIEMyMC45NjQ1MDU4LDExLjgwMTA5MDUgMjAuODg1NDg4LDExLjYxMDMyODEgMjAuNzQ0ODM1OSwxMS40Njk2Nzk3IEwyMC43NDQ4MzU5LDExLjQ2OTY3OTcgWiIgaWQ9Iui3r+W+hCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+`,
}

;(async () => {
  if (fs.existsSync(output)) {
    await rm(output)
  }
  await fs.promises.mkdir(output)
  const messages = await getMessages()
  for(const message of messages) {
    const html = compiledFunction(Object.assign(globalData, message.data))
    await fs.promises.writeFile(Path.join(output, message.name + '.html'), html, 'utf-8')
  }
})()

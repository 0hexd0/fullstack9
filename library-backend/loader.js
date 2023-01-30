const DataLoader = require('dataloader')
const Book = require('./models/book')
const { groupBy } = require('lodash')

const bookCountLoader = new DataLoader(async (authorIds) => {
  const books = await Book.find({
    author: {
      $in: authorIds,
    },
  })
  const booksByAuthorId = groupBy(books, 'author')
  return authorIds.map((authorId) => booksByAuthorId[authorId] || [])
})

module.exports = {
  bookCountLoader,
}

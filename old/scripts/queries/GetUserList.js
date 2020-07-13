const GetUserList = `
  query ($userName: String!) {
    User(name: $userName) {
      id
      name
      avatar {
        medium
      }
    }
    MediaListCollection(userName: $userName, type:ANIME) {
      lists {
        name
        entries {
          id
          progress
          status
          media {
            id
            episodes
            title {
              userPreferred
            }
            coverImage{
              medium
            }
            genres
          }
          mediaId
          score
        }
      }
    }
  }
  `
  

module.exports = {GetUserList};
function formatRegistryPackageVersion(packageVersion) {
  let specialCharsRemoved = packageVersion.replace(/[!@#$%^~&><=||*]/g, ' ')

  if (!hasWhiteSpace(specialCharsRemoved)) {
    return specialCharsRemoved
  }

  const stringArr = specialCharsRemoved.split(' ')
  const pattern = /^[0-99][\w-]*(?:\.[\w-]+)*$/i

  // find first item in array that has the package version format
  for (let item of stringArr) {
    if (pattern.test(item)) {
      if (item.length === 1) {
        return `${item}.0.0`
      }
      return item
    }
  }
}

function hasWhiteSpace(s) {
  return /\s/g.test(s)
}

module.exports = {
  formatRegistryPackageVersion,
}

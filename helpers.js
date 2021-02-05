function formatRegistryPackageVersion(packageVersion) {
  let specialCharsRemoved = packageVersion.trim().replace(/[!@#$%^~&><=||*]/g, ' ')

  // in case version is something like 3.x.x
  if (/[x]/g.test(packageVersion)) {
    return 'latest'
  }

  const stringArr = specialCharsRemoved.split(' ')
  const pattern = /^[0-99][\w-]*(?:\.[\w-]+)*$/i

  // find first item in array that has the package version format
  for (let item of stringArr) {
    if (pattern.test(item)) {
      if (item.length === 1 || item.length < 5) {
        return 'latest'
      }
      return item
    }
  }
}

module.exports = {
  formatRegistryPackageVersion,
}

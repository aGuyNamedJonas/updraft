let Config = {
  illegal : [{
    pattern: /umbraco./g,
    reason: {
      title: "Avoid the umbraco.* namespace",
      details: "This namespace is super old and you should not use it, please use the much better Umbraco.",
      link: "https://our.umbraco.com/documentation/Getting-Started/Design/Templates/"
    }
  }]
}

export {Config}

const COFFEE_PARSE_REGEX = /\d+/g

module.exports =  function (unParsedPrice) {
    if (unParsedPrice === null || unParsedPrice === "")
        return null

    const numbers = unParsedPrice.match(COFFEE_PARSE_REGEX).map(Number)

    if (numbers.length > 0) {
        if (numbers.length === 3) {
            return [numbers[0], numbers[1]]
        } else if (numbers.length <= 2) {
            return numbers[0]
        }
    }
    return  null
}
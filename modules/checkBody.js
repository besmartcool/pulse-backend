function checkBody(body, keys) { // permet de vérifier si des chmpa sosnt vides ou non
  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      isValid = false;
    }
  }

  return isValid;
}

module.exports = { checkBody };

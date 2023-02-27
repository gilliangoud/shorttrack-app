export function letterToNumber(letter) {
  // Convert the letter to lowercase to handle uppercase letters
  letter = letter.toLowerCase();

  // Get the ASCII code for the letter and subtract the ASCII code for "a"
  return letter.charCodeAt(0) - 97 + 1;
}

export function raceCompare(a, b) {
  const aNum = parseInt(a.name.slice(0, -1));
  const bNum = parseInt(b.name.slice(0, -1));
  const aLetter = a.name.slice(-1);
  const bLetter = b.name.slice(-1);

  if (aNum !== bNum) {
    return aNum - bNum;
  } else {
    return aLetter.localeCompare(bLetter);
  }
}

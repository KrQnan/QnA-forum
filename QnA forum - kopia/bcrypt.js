const bcrypt = require("bcrypt");
const saltrounds = 13;

const generatePassword = async (pwd) => {
    const salt = await bcrypt.genSalt(saltrounds);
    const hash = await bcrypt.hash(pwd, salt);
    return hash;
}

const comparePass = async (pwd, hash) =>{
    try{
        const match = await bcrypt.compare(pwd, hash);
        return match;
    }
    catch(error){
        throw Error;
    }
}

module.exports = {
    generatePassword:generatePassword,
    comparePass:comparePass,
}
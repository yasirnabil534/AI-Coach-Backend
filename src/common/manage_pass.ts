import bcrypt from 'bcrypt';

const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(13);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

const checkHash = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
}

export {
    hashPassword,
    checkHash,
}
import axios from "axios"

export const postData = async (data, url, token = null) => {
    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url,
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}`
        },
        data
    };
    
    let result = {}
    await axios.request(config)
        .then(response => result = response)
        .catch(err => result = err.response)

    return result
}

export const deleteData = async (data, url, token = null) => {
    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url,
        headers: { 
            'Content-Type': 'application/json', 
            'Cookie': `Barier ${token}`
        },
        data
    };

    let result
    await axios.request(config)
        .then((response) => result = response)
        .catch((error) => result = error.response);

    return result
}
const getAnswerFromGroq = async (message) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [{
                "role": "user",
                "content": message
            }],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

export default getAnswerFromGroq;

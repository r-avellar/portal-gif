import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Mude isso para seu Twitter se quiser.
const TWITTER_HANDLE = "hit_in_america";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS =[
  "https://media.giphy.com/media/lb5nMu0UIh4YM/giphy.gif",
  "https://media.giphy.com/media/3og0INyCmHlNylks9O/giphy.gif",
  "https://media.giphy.com/media/vX9WcCiWwUF7G/giphy.gif",
  "https://media.giphy.com/media/BIuuwHRNKs15C/giphy.gif",
  "https://media.giphy.com/media/Qumf2QovTD4QxHPjy5/giphy.gif",
  "https://media.giphy.com/media/MabG4Avj4y4T4irNp2/giphy.gif",
  "https://media.giphy.com/media/asUMuTM66MHny/giphy.gif",
  "https://media.giphy.com/media/8v4gHHMcL9756/giphy.gif"
]

const App = () => {
  /*
   * Essa função possui a lógica para definir se a Phantom Wallet
   * está conectada ou não
   */
  const [walletAddress, setWalletAddress] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [gifList, setGifList] = useState([])

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet encontrada!");

          const response = await solana.connect({ onlyIfTrusted: true})
          console.log("Conectado com chave pública: ", response.publicKey.toString());

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Objeto Solana não encontrado! Instale a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Quando seu componente 'montar' pela primeira vez, vamos verificar se
   * temos uma Phantom Wallet conectada
   */

  const connectWallet = async () => {
    const { solana } = window;

    if(solana) {
      const response = await solana.connect();
      console.log("Conectado com a Chave pública: ",
      response.publicKey.toString()
      );

      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (e) => {
    const { value } = e.target;
    setInputValue(value)
  }

  const sendGif = async () => {
    if(inputValue.length > 0){
      console.log("Gif link: ", inputValue)
      setGifList([...gifList, inputValue])
      setInputValue("")
    }else{
      console.log("Input vazio, tente novamente")
    }
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Conecte sua carteira
    </button>
  )

  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendGif();
        }}
      >
        <input 
          type="text" 
          placeholder="Entre com o link do gif!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-gif-button">
          Enviar
        </button>
      </form>
      <div className="gif-grid">
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() =>{
    if(walletAddress){
      console.log("Obtendo lista de GIFs...")

      setGifList(TEST_GIFS);
    }
  }, [walletAddress])

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" :"container"}>
        <div className="header-container">
          <p className="header">🖼 All together and mixed up 🖼</p>
          <p className="sub-text">Veja sua coleção de GIF no metaverso ✨</p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`feito com ❤️ por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
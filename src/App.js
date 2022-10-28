import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import idl from './idl.json'

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import kp from './keypair.json'

const { SystemProgram, Keypair} = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
let baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}

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

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const sendGif = async () => {
    if(inputValue.length === 0){
      console.log("Por favor insira um link")
      return
    }

    setInputValue("")
    console.log("Link do GIF: ", inputValue)
      try{
        const provider = getProvider();
        const program = new Program(idl, programID, provider);

        await program.rpc.addGif(inputValue, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
        },
      });
      console.log("GIF enviado com sucesso!! ", inputValue)
      await getGifList();
    }catch(error){
      console.log("Erro ao enviar GIF ", error)
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

  const createGifAccount = async () => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts:{
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("BaseAccount criado com sucesso com o endereço: ", baseAccount.publicKey.toString())
      await getGifList()
    }catch(error){
      console.log("Erro criando uma nova BaseAccount:", error)
    }
  }

  const renderConnectedContainer = () => {
    if(gifList === null){
      return(
        <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Fazer inicialização única para conta do programa GIF
        </button>
      </div>
      )
    }else{
      return(
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
        {gifList.map((item, index) => (
          <div className="gif-item" key={index}>
            <img src={item.gifLink}/>
          </div>
        ))}
      </div>
    </div>
    )
  }
}

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const getGifList = async() => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Conta obtida", account)
      setGifList(account.gifList)
    }catch(error){
      console.log("Erro em getGifList: ", error);
      setGifList(null);
    }
  }

  useEffect(() =>{
    if(walletAddress){
      console.log("Obtendo lista de GIFs...")
      getGifList()

      
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
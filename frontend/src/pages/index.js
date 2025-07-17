import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { fetchContents } from '../utils/fetchContents';
import Modal from 'react-modal';

Modal.setAppElement('#__next')

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showScroll, setShowScroll] = useState(false)
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        provider.getNetwork().then(network => {
          if (network.chainId !== parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)) {
            alert(`Your wallet is connected to the wrong chain. Please switch to the ${process.env.NEXT_PUBLIC_NETWORK_NAME} chain.`);
          }
        });

        // Add event listeners
        window.ethereum.on('accountsChanged', () => {
          // When the accounts change, refresh the contents
          setIsLoading(true);
          fetchContents(provider)
            .then(contents => {
              setContents(contents);
              setIsLoading(false);
            })
            .catch(error => {
              console.error(error);
              setIsLoading(false);
            });
        });

        window.ethereum.on('chainChanged', () => {
          // When the network changes, refresh the contents
          setIsLoading(true);
          fetchContents(provider)
            .then(contents => {
              setContents(contents);
              setIsLoading(false);
            })
            .catch(error => {
              console.error(error);
              setIsLoading(false);
            });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      alert('A wallet is not installed.');
    }

    // Clean up the event listeners on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged');
        window.ethereum.removeListener('chainChanged');
      }
    };
  }, []);

  const checkScrollTop = useCallback(() => {
    if (!showScroll && window.scrollY > 400){
      setShowScroll(true)
    } else if (showScroll && window.scrollY <= 400){
      setShowScroll(false)
    }
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop)
    return () => window.removeEventListener('scroll', checkScrollTop)
  }, [checkScrollTop]);

  useEffect(() => {
    if (provider) {
      setIsLoading(true);
      fetchContents(provider)
        .then(contents => {
          setContents(contents);
          setIsLoading(false);
        })
        .catch(error => {
          console.error(error);
          setIsLoading(false);
        });
    }
  }, [provider]);

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  function parseJson(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  const contentTypes = [...new Set(contents.map(content => content.contentType))];

  return (
    <div className="content-container">
      <div className="content-header" ref={headerRef}>
        <h1>SuperPiccellCore Contents</h1>
        {!isLoading && contentTypes.map(type => (
          type && (
            <button
              key={type}
              className="content-type-button"
              onClick={() => {
                const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 0;
                window.scrollTo({
                  top: document.getElementById(type).offsetTop - headerHeight,
                  behavior: 'smooth'
                });
              }}
            >
              {type}
            </button>
          )
        ))}
      </div>
      {isLoading && <p>Loading...</p>}
      {!isLoading && contentTypes.map(type => (
        <div key={type} id={type} className="content-section">
          <h2>{type}</h2>
          {contents.filter(content => content.contentType === type).map(content => (
            <div key={content.id.toString()} className="content-item">
              {/* 初期表示される詳細情報 */}
              <div className="content-details">
                {content.content && Object.entries(JSON.parse(content.content)).map(([key, value]) => {
                  let displayElement;
                  if (value === null) {
                    displayElement = <p key={key}>{key}: -</p>;
                  } else if (key === 'image') {
                    displayElement = <p key={key}>{key}: <img src={value} alt="content" /></p>;
                  } else if (Array.isArray(value)) {
                    const displayValue = value.map(v => v === null ? '-' : (typeof v === 'string' ? parseJson(v) : v)).join(', ');
                    displayElement = <p key={key}>{key}: {displayValue}</p>;
                  } else {
                    const displayValue = typeof value === 'string' ? parseJson(value) : value;
                    displayElement = <p key={key}>{key}: {displayValue}</p>;
                  }
                  return displayElement;
                })}
              </div>
              {/* アコーディオンで表示される基本情報 */}
              {expandedId === content.id && (
                <div className="content-basic">
                  <p>Content ID: {content.id.toString()}</p>
                  <p>Encoding: {content.encoding}</p>
                  <p>Content Type: {content.contentType}</p>
                  <p>Revision: {content.revision}</p>
                  <p>Created at: {new Date(content.createdAt * 1000).toLocaleString()}</p>
                  <p>Updated by: {content.updatedBy}</p>
                </div>
              )}
              <button onClick={() => toggleDetails(content.id)} className="details-button">
                {expandedId === content.id ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          ))}
        </div>
      ))}
      {(
        <button className="scrollToTopButton" onClick={scrollTop} style={{display: showScroll ? 'flex' : 'none'}}>
          Top
        </button>
      )}
    </div>
  );
}

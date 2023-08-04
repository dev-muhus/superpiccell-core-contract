import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { fetchContents } from '../utils/fetchContents';
import Modal from 'react-modal';
import './index.css';

Modal.setAppElement('#__next')

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false)
  const headerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
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
    if (!showScroll && window.pageYOffset > 400){
      setShowScroll(true)
    } else if (showScroll && window.pageYOffset <= 400){
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

  const openModal = (content) => {
    setModalContent(content);
    setIsOpen(true);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  const ContentModal = ({ content }) => (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Content Modal"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={closeModal} className="close-button">X</button>
      {content && Object.entries(JSON.parse(content.content)).map(([key, value]) => {
        let displayValue = '';
        if (value === null) {
          displayValue = '-';
        } else if (Array.isArray(value)) {
          displayValue = value.map(v => v === null ? '-' : (typeof v === 'string' ? parseJson(v) : v)).join(', ');
        } else {
          displayValue = typeof value === 'string' ? parseJson(value) : value;
        }
        return <p key={key}>{key}: {displayValue}</p>;
      })}
    </Modal>
  )
  
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
      <div className="content-header" style={{ zIndex: modalIsOpen ? -1 : 100 }} ref={headerRef}>
        <h1>SuperPiccellCore Contents</h1>
        {!isLoading && contentTypes.map(type => (
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
        ))}
      </div>
      {isLoading && <p>Loading...</p>}
      {!isLoading && contentTypes.map(type => (
        <div key={type} id={type} className="content-section">
          <h2>{type}</h2>
          {contents.filter(content => content.contentType === type).map(content => (
            <div key={content.id.toString()} className="content-item">
              <p>Content ID: {content.id.toString()}</p>
              <p>Encoding: {content.encoding}</p>
              <p>Content Type: {content.contentType}</p>
              <p>Revision: {content.revision}</p>
              <p>Created at: {new Date(content.createdAt * 1000).toLocaleString()}</p>
              <p>Updated by: {content.updatedBy}</p>
              <button onClick={() => openModal(content)} className="details-button">Details</button>
              <ContentModal content={modalContent} />
            </div>
          ))}
        </div>
      ))}
      {!modalIsOpen && (
        <button className="scrollToTopButton" onClick={scrollTop} style={{display: showScroll ? 'flex' : 'none'}}>
          Top
        </button>
      )}
    </div>
  );
}

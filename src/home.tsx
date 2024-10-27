import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryProfile } from "nostr-tools/nip05";
import * as nip19 from "nostr-tools/nip19";

function LandingPage() {
  const [nostrID, setNostrID] = useState("");
  const [openAccordion, setOpenAccordion] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (nostrID.includes("@")) {
      let profile = await queryProfile(nostrID);
      navigate(`/profile/${nip19.npubEncode(String(profile?.pubkey))}`);
    } else if (nostrID) {
      navigate(`/profile/${nostrID}`);
    }
  };

  const scrollToFAQ = () => {
    document.getElementById("faq").scrollIntoView({ behavior: "smooth" });
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="font-sans h-screen bg-gray-50 flex flex-col items-center py-10 overflow-auto">
      <div className="bg-white p-8 rounded shadow-md mt-20 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-green-600">Find Your Nostr Profile</h1>
        <p className="text-gray-600 mb-4">Enter your Nostr ID below to access your donation page.</p>
        <input
          type="text"
          className="w-full px-4 h-14 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your Nostr ID (npub) or username@domain.com"
          value={nostrID}
          onChange={(e) => setNostrID(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={!nostrID}
          className="w-full h-14 bg-green-500 text-white py-2 rounded-lg disabled:bg-green-300 transition duration-200 mb-4"
        >
          Search
        </button>
        <button
          onClick={scrollToFAQ}
          className="w-full  text-gray-700 py-2 rounded-lg transition duration-200"
        >
          Learn More - FAQ
        </button>
      </div>

      <div id="faq" className="bg-white p-8 rounded shadow-md max-w-2xl w-full mt-16">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">Frequently Asked Questions</h2>
        <div className="mb-4">
          <button
            onClick={() => toggleAccordion(0)}
            className="w-full text-left font-semibold text-lg text-gray-800 py-2 border-b border-gray-300"
          >
            How does it work?
          </button>
          {openAccordion === 0 && (
            <p className="text-gray-600 mt-2">
              To start receiving donations, simply create a Nostr account and set up a Lightning Address in your profile.
              All donations will be directed to this address, along with any attached messages.
            </p>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() => toggleAccordion(1)}
            className="w-full text-left font-semibold text-lg text-gray-800 py-2 border-b border-gray-300"
          >
            What is Nostr?
          </button>
          {openAccordion === 1 && (
            <p className="text-gray-600 mt-2">
              Nostr (Notes and Other Stuff Transmitted by Relays) is a decentralized network that allows users to post
              messages and interact in a peer-to-peer manner, removing the reliance on centralized platforms.
            </p>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() => toggleAccordion(2)}
            className="w-full text-left font-semibold text-lg text-gray-800 py-2 border-b border-gray-300"
          >
            What is a Lightning Address?
          </button>
          {openAccordion === 2 && (
            <p className="text-gray-600 mt-2">
              A Lightning Address is a simple, user-friendly identifier that represents a payment endpoint on the
              Lightning Network. It allows people to send payments instantly across the network using a human-readable
              address.
            </p>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() => toggleAccordion(3)}
            className="w-full text-left font-semibold text-lg text-gray-800 py-2 border-b border-gray-300"
          >
            What networks are supported?
          </button>
          {openAccordion === 3 && (
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>
                <strong>Lightning:</strong> A fast, low-cost layer built on top of Bitcoin for near-instant
                transactions.
              </li>
              <li>
                <strong>Liquid:</strong> A sidechain of Bitcoin designed for faster, more private transactions with added
                security.
              </li>
              <li>
                <strong>PIX:</strong> A Brazilian instant payment system created by the Central Bank of Brazil, enabling
                real-time transactions.
              </li>
              <li>
                <strong>DePIX:</strong> Depix is a stablecoin, a transition token backed by reais, that uses the PIX payment system as an endpoint and the Liquid blockchain to issue its tokens. This approach provides greater privacy in transactions, thanks to the use of confidential transactions.
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

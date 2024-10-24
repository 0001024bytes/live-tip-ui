import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryProfile } from 'nostr-tools/nip05'
import * as nip19 from "nostr-tools/nip19";

function LandingPage() {
  const [nostrID, setNostrID] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (nostrID.includes("@") === true) {
        let profile = await queryProfile(nostrID)
        navigate(`/profile/${nip19.npubEncode(String(profile?.pubkey))}`);
    } else if (nostrID) {
        navigate(`/profile/${nostrID}`);

    }
  };

  return (
    <div className="font-sans h-screen bg-green-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-green-600">
          Find Your Nostr Profile
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Enter your Nostr ID below to access your donation page.
        </p>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your Nostr ID (npub) or username@domain.com"
          value={nostrID}
          onChange={(e) => setNostrID(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={!nostrID}
          className="w-full bg-green-500 text-white py-2 rounded-lg disabled:bg-green-300 transition duration-200"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default LandingPage;

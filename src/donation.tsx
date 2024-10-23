import * as nip19 from "nostr-tools/nip19";
import { useState, useEffect } from "react";
import { SimplePool } from "nostr-tools/pool";
import { BadgeCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/dialog";
import { QRCodeCanvas } from "qrcode.react";
import api from "./services/api";

function Donation() {
  const [displayName, setDisplayName] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");
  const [picture, setPicture] = useState("");
  const [banner, setBanner] = useState("");
  const [about, setAbout] = useState("");
  const [verified, setVerified] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [address, setAddress] = useState("")
  const { nostrID } = useParams();

  async function fetchProfile() {
    const pool = new SimplePool();
    const { data } = nip19.decode(String(nostrID));

    await pool.subscribeMany(
      [
        "wss://strfry.iris.to/",
        "wss://relay.damus.io/",
        "wss://relay.nostr.band/",
        "wss://relay.snort.social/",
      ],
      [
        {
          kinds: [0],
          authors: [data.toString()],
        },
      ],
      {
        onevent(event) {
          const content = JSON.parse(event.content);
          setDisplayName(content?.display_name);
          setAbout(content?.about);
          setPicture(content?.picture);
          setBanner(content?.banner);
          setVerified(content?.nip05valid);
          setLightningAddress(content?.lud16);
          console.log("got event:", content);
        },
      }
    );
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const isFormComplete = () => amount && description;

  return (
    <div className=" font-sans h-screen bg-green-100">
      <div className="max-w-4xl mx-auto overflow-hidden h-full bg-white">
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col">
            <div className="w-full flex justify-center overflow-hidden">
              {banner ? (
                <img
                  src={banner}
                  alt="Banner"
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 w-full object-cover bg-orange-300" />
              )}
            </div>
            <div className="relative rounded-3xl flex flex-col items-center mt-[-40px]">
              {picture ? (
                <img
                  src={picture}
                  alt="Profile Picture"
                  className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg" />
              )}

              <div className="flex flex-row gap-3 items-center mt-2">
                <h2 className="text-xl md:text-2xl font-semibold">
                  {displayName}
                </h2>
                {verified && (
                  <BadgeCheck className="text-blue-500 rounded-full" size={24} />
                )}
              </div>
              <p className="mt-4 text-sm md:text-base text-gray-700 text-center px-4 md:px-8">
                {about}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-12">
            <h3 className="text-lg md:text-xl font-semibold">
              Support {displayName}
            </h3>
            <p className="text-sm md:text-base text-gray-500 mb-4">
              Choose an amount to donate
            </p>

            <div className="flex space-x-2 mb-4">
              {["$1", "$10", "$15"].map((presetAmount) => (
                <button
                  key={presetAmount}
                  onClick={() => setAmount(presetAmount)}
                  className={`bg-green-100 text-green-600 px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-green-200 transition duration-200 ${
                    amount === presetAmount ? "bg-green-300" : ""
                  }`}
                >
                  {presetAmount}
                </button>
              ))}
              <input
                type="text"
                className="w-20 md:w-28 px-2 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="$0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <textarea
              className="w-full px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Say something here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            {isFormComplete() && (
              <div className="mt-4">
                <h4 className="text-base font-semibold">Payment Method</h4>
                <p className="text-sm md:text-base text-gray-500">
                  Choose the payment method to make your donation.
                </p>
                <div className="flex space-x-4 mt-2">
                  {["Lightning", "Liquid", "PIX"].map((method) => (
                    <button
                      key={method.toLowerCase()}
                      onClick={() => setPaymentMethod(method.toLowerCase())}
                      className={`px-4 py-2 md:px-6 md:py-3 border rounded-full ${
                        paymentMethod === method.toLowerCase()
                          ? "bg-green-500 text-white"
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Dialog>
              <DialogTrigger className="w-full">
                <button
                  disabled={!lightningAddress || !isFormComplete() || !paymentMethod}
                  className="w-full h-12 md:h-14 bg-green-500 text-white disabled:bg-slate-400 mt-4 py-2 md:py-3 rounded-lg flex justify-center items-center hover:bg-green-600 transition duration-200"
                  onClick={() => {
                    api.createAddress(
                      String(nostrID), 
                      Number(amount.replace("$", "")), 
                      paymentMethod, 
                      description
                    ).then((r) => {
                      const data = r.data;
                      setAddress(data?.address)
                    })
                  }}
                >
                  <img
                    src="https://static-00.iconduck.com/assets.00/money-with-wings-emoji-1024x860-325l9x4i.png"
                    alt="Donate Icon"
                    className="w-5 h-5 mr-2 md:w-6 md:h-6"
                  />
                  Take My Money
                </button>
              </DialogTrigger>
              <DialogContent className="flex flex-col gap-5 p-6 md:p-8">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl flex flex-row gap-2 font-semibold text-start">
                    <img
                      src="https://static-00.iconduck.com/assets.00/money-with-wings-emoji-1024x860-325l9x4i.png"
                      alt="Donate Icon"
                      className="w-5 h-5 mr-2 md:w-6 md:h-6"
                    />
                    Make your donation of {amount}
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-base text-gray-500 text-start">
                    Scan the code above with your payment app to donate via {paymentMethod}.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex justify-start">
                  {lightningAddress && (
                    <QRCodeCanvas
                      value={address}
                      size={180}
                      level={"H"}
                      includeMargin={true}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Donation;

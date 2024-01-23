const Form = ({ submitHandler, setUserName, userName, setRoom, room }: any) => {
  return (
    <>
      <div className="bg-gray-800 p-8 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-100">
          Join a Room
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitHandler();
          }}
        >
          <div className="mb-4 flex flex-col gap-4">
            <input
              type="text"
              id="userName"
              name="userName"
              onChange={(e) => setUserName(e?.target?.value)}
              value={userName}
              className="w-full p-2 bg-gray-700 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-100"
              placeholder="Enter Name"
              required
            />
            <input
              type="text"
              id="roomCode"
              name="roomCode"
              onChange={(e) => setRoom(e?.target?.value)}
              value={room}
              className="w-full p-2 bg-gray-700 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-100"
              placeholder="Enter room code"
              required
            />
          </div>

          <div className="text-center flex justify-center items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-5 py-2 flex justify-center items-center font-semibold rounded-lg border-2 text-sm border-blue-500 hover:bg-blue-600 hover:border-blue-600 transition duration-200"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Form;

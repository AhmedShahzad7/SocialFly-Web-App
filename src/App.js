import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Home from "./Pages/Home";
import Settings from "./Pages/Settings Page/Settings";
import About from "./Pages/Settings Page/About";
import Search from "./Pages/Search";
import Profile from "./Pages/Profile Page/Profile";
import FriendList from "./Pages/Profile Page/FriendList";
import CreatePost from "./Pages/Profile Page/CreatePost";
import ChatPage from "./Pages/Chat Page/ChatPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friend-list" element={<FriendList />} />
        <Route path="/create-post" element={<CreatePost />} />
            <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

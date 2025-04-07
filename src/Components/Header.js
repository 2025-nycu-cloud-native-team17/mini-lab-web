import menu from '../Icons/menu.png'
import profile from '../Icons/profile.png'

function Header() {
  return (
      <header className="flex bg-[#D9D9D9] text-4xl h-24 items-center">
        <img src={menu} alt="menu" className="size-16 mx-6" />
        <div>
            Mini Lab
        </div>
        <img src={profile} alt="profile" className="ml-auto size-16 mx-6"/>
      </header>
  );
}

export default Header;
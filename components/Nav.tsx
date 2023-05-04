import { Navbar, Button, Text } from "@nextui-org/react";

export default function Nav() {

    function logout() {
        // remove token from local storage
        localStorage.removeItem('token');
        // redirect to login page
        window.location.href = '/login';
    }

    return <Navbar>
    <Navbar.Brand>
      <Text b color="inherit" hideIn="xs">
        URL transform services
      </Text>
    </Navbar.Brand>
    <Navbar.Content>
      <Navbar.Item>
        <Button size={"sm"} color={"secondary"} onPress={logout}>
          Leave
        </Button>
      </Navbar.Item>
    </Navbar.Content>
  </Navbar>
}
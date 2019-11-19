import React, { Component } from 'react';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      getParam: PropTypes.func,
    }).isRequired,
  };

  constructor() {
    super();
    this.state = {
      stars: [],
      loading: true,
      page: 1,
      refreshing: false,
    };
  }

  async componentDidMount() {
    this.loadStars();
  }

  loadStars = async () => {
    const { navigation } = this.props;

    const { stars, page } = this.state;

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page: page + 1,
      refreshing: false,
      loading: false,
    });
  };

  refreshList = async () => {
    this.setState({ page: 1, stars: [], refreshing: true }, this.loadStars);
  };

  handleNavigation = repo => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repo });
  };

  render() {
    const { navigation } = this.props;

    const user = navigation.getParam('user');

    const { stars, loading, refreshing } = this.state;

    if (loading) {
      return <Loading />;
    }
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          onEndReachedThreshold={0.2}
          onEndReached={this.loadStars}
          onRefresh={this.refreshList}
          refreshing={refreshing}
          data={stars}
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred onPress={() => this.handleNavigation(item)}>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}

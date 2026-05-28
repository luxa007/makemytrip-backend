package com.makemytrip.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String password;
    private final List<GrantedAuthority> authorities;

    public UserPrincipal(Long id, String email, String password, List<String> roles) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = roles.stream()
                .<GrantedAuthority>map(SimpleGrantedAuthority::new).toList();
    }

    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
}
